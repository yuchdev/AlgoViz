add_library(algoviz-runtime STATIC src/runtime.cpp)
add_library(AlgoViz::Runtime ALIAS algoviz-runtime)

target_include_directories(
    algoviz-runtime
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)
target_compile_features(algoviz-runtime PUBLIC cxx_std_20)

if(BUILD_TESTING AND ALGOVIZ_BUILD_TESTS)
    add_executable(algoviz-runtime-test tests/runtime_test.cpp)
    target_link_libraries(algoviz-runtime-test PRIVATE algoviz-runtime)
    add_test(NAME algoviz-runtime-test COMMAND algoviz-runtime-test)
endif()
