#include "algoviz/analysis_result.hpp"

#include <string_view>

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

    for (char ch : value) {
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
            output << ch;
            break;
        }
    }

    output << '"';
}

class VectorMatchCallback : public clang::ast_matchers::MatchFinder::MatchCallback {
public:
    explicit VectorMatchCallback(algoviz::AnalysisResult& result) : result_(result) {}

    void run(const clang::ast_matchers::MatchFinder::MatchResult& result) override {
        const auto* declaration = result.Nodes.getNodeAs<clang::VarDecl>("vectorVar");
        if (declaration == nullptr || declaration->isImplicit()) {
            return;
        }

        clang::PrintingPolicy policy(result.Context->getLangOpts());
        policy.SuppressScope = false;

        result_.objects.push_back({
            .id = declaration->getNameAsString(),
            .name = declaration->getNameAsString(),
            .kind = "sequence",
            .cpp_type = declaration->getType().getAsString(policy),
        });
    }

private:
    algoviz::AnalysisResult& result_;
};

clang::ast_matchers::DeclarationMatcher vector_matcher() {
    using namespace clang::ast_matchers;

    return varDecl(
               unless(isImplicit()),
               hasType(hasUnqualifiedDesugaredType(recordType(hasDeclaration(
                   classTemplateSpecializationDecl(hasName("::std::vector")))))))
        .bind("vectorVar");
}

void write_json_result(const algoviz::AnalysisResult& result) {
    llvm::outs() << "{\"supported\":" << (result.supported ? "true" : "false")
                 << ",\"diagnostics\":[";

    for (std::size_t index = 0; index < result.diagnostics.size(); ++index) {
        if (index > 0) {
            llvm::outs() << ',';
        }

        write_escaped_json_string(llvm::outs(), result.diagnostics[index]);
    }

    llvm::outs() << "],\"objects\":[";

    for (std::size_t index = 0; index < result.objects.size(); ++index) {
        const auto& object = result.objects[index];
        if (index > 0) {
            llvm::outs() << ',';
        }

        llvm::outs() << "{\"id\":";
        write_escaped_json_string(llvm::outs(), object.id);
        llvm::outs() << ",\"name\":";
        write_escaped_json_string(llvm::outs(), object.name);
        llvm::outs() << ",\"kind\":";
        write_escaped_json_string(llvm::outs(), object.kind);
        llvm::outs() << ",\"cpp_type\":";
        write_escaped_json_string(llvm::outs(), object.cpp_type);
        llvm::outs() << '}';
    }

    llvm::outs() << "]}\n";
}

} // namespace

int main(int argc, const char** argv) {
    auto options_parser =
        clang::tooling::CommonOptionsParser::create(argc, argv, AlgoVizCategory);
    if (!options_parser) {
        llvm::errs() << llvm::toString(options_parser.takeError()) << '\n';
        return 1;
    }

    auto& parser = options_parser.get();
    clang::tooling::ClangTool tool(parser.getCompilations(), parser.getSourcePathList());

    algoviz::AnalysisResult analysis_result;
    VectorMatchCallback callback(analysis_result);
    clang::ast_matchers::MatchFinder finder;
    finder.addMatcher(vector_matcher(), &callback);

    const int exit_code = tool.run(clang::tooling::newFrontendActionFactory(&finder).get());
    if (exit_code != 0) {
        return exit_code;
    }

    write_json_result(analysis_result);
    return 0;
}
