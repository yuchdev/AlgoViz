#pragma once

#include <optional>
#include <string>
#include <vector>

namespace algoviz {

struct SourcePosition {
    int line{};
    int column{};
};

struct SourceLocation {
    std::string path;
    SourcePosition start;
    std::optional<SourcePosition> end;
};

struct DiscoveredObject {
    std::string id;
    std::string name;
    std::string kind;
    std::string cppType;
};

struct AnalysisDiagnostic {
    std::string severity;
    std::string code;
    std::string message;
    std::optional<SourceLocation> source;
};

struct AnalysisResult {
    bool supported{true};
    std::vector<AnalysisDiagnostic> diagnostics;
    std::vector<DiscoveredObject> objects;
};

} // namespace algoviz
