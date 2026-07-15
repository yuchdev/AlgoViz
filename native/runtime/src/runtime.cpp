#include "algoviz/runtime.hpp"

#include <iomanip>
#include <ostream>
#include <string_view>

namespace algoviz {
namespace {

void write_escaped_json_string(std::ostream& output, std::string_view value) {
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
                const auto flags = output.flags();
                const auto fill = output.fill();
                output << "\\u" << std::hex << std::nouppercase << std::setw(4)
                       << std::setfill('0') << static_cast<int>(ch);
                output.flags(flags);
                output.fill(fill);
            } else {
                output << static_cast<char>(ch);
            }
            break;
        }
    }

    output << '"';
}

} // namespace

void write_json_line(std::ostream& output, const SequenceCreatedEvent& event) {
    output << "{\"schemaVersion\":1,\"sequence\":" << event.sequence
           << ",\"kind\":\"sequence.created\",\"objectId\":";
    write_escaped_json_string(output, event.object_id);
    output << ",\"displayName\":";
    write_escaped_json_string(output, event.display_name);
    output << ",\"values\":[";

    for (std::size_t index = 0; index < event.values.size(); ++index) {
        if (index > 0) {
            output << ',';
        }

        output << event.values[index];
    }

    output << "]}\n";
}

} // namespace algoviz
