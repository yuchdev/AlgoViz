#pragma once

#include <cstddef>
#include <iosfwd>
#include <string>
#include <vector>

namespace algoviz {

struct SequenceCreatedEvent {
    std::size_t sequence{};
    std::string object_id;
    std::string display_name;
    std::vector<int> values;
};

void write_json_line(std::ostream& output, const SequenceCreatedEvent& event);

} // namespace algoviz
