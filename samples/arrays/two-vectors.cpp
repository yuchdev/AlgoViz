#include <vector>

int main() {
    std::vector<int> values{7, 4, 9, 1, 3};
    std::vector<int> scratch(values.size(), 0);
    return scratch.size() == values.size() ? 0 : 1;
}
