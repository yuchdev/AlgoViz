#include "algoviz/runtime.hpp"

#include <sstream>
#include <string>

int main() {
    std::ostringstream output;
    algoviz::write_json_line(
        output,
        algoviz::SequenceCreatedEvent{
            .sequence = 1,
            .object_id = "values-1",
            .display_name = "values",
            .values = {7, 4, 9},
        }
    );

    const std::string json = output.str();

    if (json.find("sequence.created") == std::string::npos) {
        return 1;
    }

    if (json.find("[7,4,9]") == std::string::npos) {
        return 1;
    }

    return 0;
}
