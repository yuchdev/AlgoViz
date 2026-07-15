#include "algoviz/runtime.hpp"

#include <sstream>
#include <string>

namespace {

int expect_equal(const std::string& actual, const std::string& expected) {
    return actual == expected ? 0 : 1;
}

} // namespace

int main() {
    {
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
        if (expect_equal(
                output.str(),
                "{\"schemaVersion\":1,\"sequence\":1,\"kind\":\"sequence.created\",\"objectId\":\"values-1\",\"displayName\":\"values\",\"values\":[7,4,9]}\n"
            ) != 0) {
            return 1;
        }
    }

    {
        std::ostringstream output;
        algoviz::write_json_line(
            output,
            algoviz::SequenceCreatedEvent{
                .sequence = 2,
                .object_id = "values-2",
                .display_name = "quoted \"name\"",
                .values = {1, 2, 3},
            }
        );
        if (expect_equal(
                output.str(),
                "{\"schemaVersion\":1,\"sequence\":2,\"kind\":\"sequence.created\",\"objectId\":\"values-2\",\"displayName\":\"quoted \\\"name\\\"\",\"values\":[1,2,3]}\n"
            ) != 0) {
            return 1;
        }
    }

    {
        std::ostringstream output;
        std::string display_name = "line\n\tbreak\r";
        display_name.push_back(static_cast<char>(0x01));
        algoviz::write_json_line(
            output,
            algoviz::SequenceCreatedEvent{
                .sequence = 3,
                .object_id = "values-3",
                .display_name = display_name,
                .values = {},
            }
        );
        if (expect_equal(
                output.str(),
                "{\"schemaVersion\":1,\"sequence\":3,\"kind\":\"sequence.created\",\"objectId\":\"values-3\",\"displayName\":\"line\\n\\tbreak\\r\\u0001\",\"values\":[]}\n"
            ) != 0) {
            return 1;
        }
    }

    return 0;
}
