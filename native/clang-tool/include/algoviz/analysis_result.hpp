#pragma once

#include <string>
#include <vector>

namespace algoviz {

struct DiscoveredObject {
    std::string id;
    std::string name;
    std::string kind;
    std::string cpp_type;
};

struct AnalysisResult {
    bool supported{true};
    std::vector<std::string> diagnostics;
    std::vector<DiscoveredObject> objects;
};

} // namespace algoviz
