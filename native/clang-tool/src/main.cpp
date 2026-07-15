#include "algoviz/analysis_result.hpp"

#include <cstddef>
#include <optional>
#include <string>
#include <string_view>
#include <unordered_set>

#include "clang/AST/Decl.h"
#include "clang/AST/PrettyPrinter.h"
#include "clang/ASTMatchers/ASTMatchFinder.h"
#include "clang/ASTMatchers/ASTMatchers.h"
#include "clang/Tooling/CommonOptionsParser.h"
#include "clang/Tooling/Tooling.h"
#include "llvm/Support/CommandLine.h"
#include "llvm/Support/Error.h"
#include "llvm/Support/raw_ostream.h"

namespace {

llvm::cl::OptionCategory AlgoVizCategory("algoviz-analyzer options");

void write_escaped_json_string(llvm::raw_ostream& output, std::string_view value) {
    output << '"';

    for (unsigned char ch : value) {
        switch (ch) {
        case '\\':
            output << "\\\\";
            break;
        case '"':
            output << "\\\"";
            break;
        case '\n':
            output << "\\n";
            break;
        case '\r':
            output << "\\r";
            break;
        case '\t':
            output << "\\t";
            break;
        default:
            if (ch < 0x20U) {
                static constexpr char kDigits[] = "0123456789abcdef";
                // Emit JSON control-byte escapes as \u00XX.
                output << "\\u00" << kDigits[(ch >> 4U) & 0x0FU]
                       << kDigits[ch & 0x0FU];
            } else {
                output << static_cast<char>(ch);
            }
            break;
        }
    }

    output << '"';
}

void write_source_position(llvm::raw_ostream& output, const algoviz::SourcePosition& position) {
    output << "{\"line\":" << position.line << ",\"column\":" << position.column << '}';
}

void write_source_location(llvm::raw_ostream& output, const algoviz::SourceLocation& location) {
    output << "{\"path\":";
    write_escaped_json_string(output, location.path);
    output << ",\"start\":";
    write_source_position(output, location.start);
    if (location.end.has_value()) {
        output << ",\"end\":";
        write_source_position(output, *location.end);
    }
    output << '}';
}

void write_json_result(llvm::raw_ostream& output, const algoviz::AnalysisResult& result) {
    output << "{\"supported\":" << (result.supported ? "true" : "false")
           << ",\"diagnostics\":[";

    for (std::size_t index = 0; index < result.diagnostics.size(); ++index) {
        const auto& diagnostic = result.diagnostics[index];
        if (index > 0) {
            output << ',';
        }

        output << "{\"severity\":";
        write_escaped_json_string(output, diagnostic.severity);
        output << ",\"code\":";
        write_escaped_json_string(output, diagnostic.code);
        output << ",\"message\":";
        write_escaped_json_string(output, diagnostic.message);
        if (diagnostic.source.has_value()) {
            output << ",\"source\":";
            write_source_location(output, *diagnostic.source);
        }
        output << '}';
    }

    output << "],\"objects\":[";

    for (std::size_t index = 0; index < result.objects.size(); ++index) {
        const auto& object = result.objects[index];
        if (index > 0) {
            output << ',';
        }

        output << "{\"id\":";
        write_escaped_json_string(output, object.id);
        output << ",\"name\":";
        write_escaped_json_string(output, object.name);
        output << ",\"kind\":";
        write_escaped_json_string(output, object.kind);
        output << ",\"cppType\":";
        write_escaped_json_string(output, object.cpp_type);
        output << '}';
    }

    output << "]}\n";
}

class VectorMatchCallback : public clang::ast_matchers::MatchFinder::MatchCallback {
public:
    explicit VectorMatchCallback(algoviz::AnalysisResult& result) : result_(result) {}

    void run(const clang::ast_matchers::MatchFinder::MatchResult& result) override {
        const auto* declaration = result.Nodes.getNodeAs<clang::VarDecl>("vectorVar");
        if (declaration == nullptr || declaration->isImplicit() || declaration->getIdentifier() == nullptr) {
            return;
        }

        const auto* canonical = declaration->getCanonicalDecl();
        if (!seen_.insert(canonical).second) {
            return;
        }

        clang::PrintingPolicy policy(result.Context->getLangOpts());
        policy.SuppressScope = false;

        result_.objects.push_back({
            .id = "object-" + std::to_string(result_.objects.size() + 1U),
            .name = declaration->getNameAsString(),
            .kind = "sequence",
            .cpp_type = declaration->getType().getAsString(policy),
        });
    }

private:
    algoviz::AnalysisResult& result_;
    std::unordered_set<const clang::VarDecl*> seen_;
};

clang::ast_matchers::DeclarationMatcher vector_matcher() {
    using namespace clang::ast_matchers;

    return varDecl(
               unless(isImplicit()),
               hasType(hasUnqualifiedDesugaredType(recordType(hasDeclaration(
                   classTemplateSpecializationDecl(hasName("::std::vector")))))))
        .bind("vectorVar");
}

} // namespace

int main(int argc, const char** argv) {
    auto options_parser = clang::tooling::CommonOptionsParser::create(argc, argv, AlgoVizCategory);
    if (!options_parser) {
        llvm::errs() << llvm::toString(options_parser.takeError()) << '\n';
        algoviz::AnalysisResult result;
        result.supported = false;
        result.diagnostics.push_back({
            .severity = "error",
            .code = "clang.options",
            .message = "Failed to parse Clang arguments",
            .source = std::nullopt,
        });
        write_json_result(llvm::outs(), result);
        return 1;
    }

    auto& parser = options_parser.get();
    algoviz::AnalysisResult analysis_result;
    VectorMatchCallback callback(analysis_result);
    clang::ast_matchers::MatchFinder finder;
    finder.addMatcher(vector_matcher(), &callback);

    clang::tooling::ClangTool tool(parser.getCompilations(), parser.getSourcePathList());
    const int exit_code = tool.run(clang::tooling::newFrontendActionFactory(&finder).get());

    if (exit_code != 0) {
        llvm::errs() << "algoviz-analyzer: Clang tooling failed with exit code " << exit_code << '\n';
        analysis_result.supported = false;
        analysis_result.diagnostics.push_back({
            .severity = "error",
            .code = "clang.execution",
            .message = "Clang tooling execution failed",
            .source = std::nullopt,
        });
        write_json_result(llvm::outs(), analysis_result);
        return exit_code;
    }

    write_json_result(llvm::outs(), analysis_result);
    return 0;
}
