#include <cstddef>
#include <utility>
#include <vector>

namespace {

void selection_sort(std::vector<int>& values) {
    for (std::size_t left = 0; left < values.size(); ++left) {
        std::size_t smallest = left;

        for (std::size_t right = left + 1; right < values.size(); ++right) {
            if (values[right] < values[smallest]) {
                smallest = right;
            }
        }

        if (smallest != left) {
            std::swap(values[left], values[smallest]);
        }
    }
}

} // namespace

int main() {
    std::vector<int> values{7, 4, 9, 1, 3};
    selection_sort(values);
    return values.empty() ? 1 : 0;
}
