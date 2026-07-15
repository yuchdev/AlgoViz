cmake_minimum_required(VERSION 3.28)

project(AlgoViz VERSION 0.1.0 LANGUAGES CXX)

option(ALGOVIZ_BUILD_CLANG_TOOL "Build Clang analyzer" ON)
option(ALGOVIZ_BUILD_TESTS "Build tests" ON)
option(ALGOVIZ_WARNINGS_AS_ERRORS "Treat compiler warnings as errors" ON)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(MSVC)
    add_compile_options(/W4 /permissive- /EHsc)
    if(ALGOVIZ_WARNINGS_AS_ERRORS)
        add_compile_options(/WX)
    endif()
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
    if(ALGOVIZ_WARNINGS_AS_ERRORS)
        add_compile_options(-Werror)
    endif()
endif()

include(CTest)
add_subdirectory(native/runtime)

if(ALGOVIZ_BUILD_CLANG_TOOL)
    add_subdirectory(native/clang-tool)
endif()
