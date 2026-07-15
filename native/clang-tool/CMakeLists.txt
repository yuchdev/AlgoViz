if(DEFINED ENV{LLVM_DIR})
    list(APPEND CMAKE_PREFIX_PATH "$ENV{LLVM_DIR}")
endif()

if(DEFINED ENV{Clang_DIR})
    list(APPEND CMAKE_PREFIX_PATH "$ENV{Clang_DIR}")
endif()

find_package(LLVM REQUIRED CONFIG)
find_package(Clang REQUIRED CONFIG)

message(STATUS "Found LLVM ${LLVM_PACKAGE_VERSION}")
message(STATUS "LLVM_DIR=${LLVM_DIR}")
message(STATUS "Clang_DIR=${Clang_DIR}")

find_library(
    ALGOVIZ_LLVM_SHARED_LIBRARY
    NAMES LLVM-${LLVM_VERSION_MAJOR} LLVM
    HINTS ${LLVM_LIBRARY_DIRS}
)

add_executable(algoviz-analyzer src/main.cpp)
target_include_directories(
    algoviz-analyzer
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)
target_include_directories(
    algoviz-analyzer
    SYSTEM PRIVATE
        ${LLVM_INCLUDE_DIRS}
        ${CLANG_INCLUDE_DIRS}
)
target_compile_features(algoviz-analyzer PRIVATE cxx_std_20)
target_compile_definitions(algoviz-analyzer PRIVATE ${LLVM_DEFINITIONS})

if(TARGET clang-cpp)
    target_link_libraries(algoviz-analyzer PRIVATE clang-cpp)

    if(ALGOVIZ_LLVM_SHARED_LIBRARY)
        target_link_libraries(algoviz-analyzer PRIVATE ${ALGOVIZ_LLVM_SHARED_LIBRARY})
    else()
        target_link_libraries(algoviz-analyzer PRIVATE LLVMSupport)
    endif()
else()
    message(STATUS "clang-cpp target unavailable; linking explicit Clang libraries")
    target_link_libraries(
        algoviz-analyzer
        PRIVATE
            clangAST
            clangASTMatchers
            clangBasic
            clangFrontend
            clangSerialization
            clangTooling
            clangToolingCore
            LLVMSupport
    )
endif()

if(BUILD_TESTING AND ALGOVIZ_BUILD_TESTS)
    find_program(ALGOVIZ_NODE_EXECUTABLE NAMES node REQUIRED)
    add_test(
        NAME algoviz-analyzer-one-vector
        COMMAND ${ALGOVIZ_NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tests/verify-analysis.mjs
                ${CMAKE_CURRENT_BINARY_DIR}/algoviz-analyzer
                ${PROJECT_SOURCE_DIR}/samples/arrays/selection-sort.cpp
                one-vector
    )
    add_test(
        NAME algoviz-analyzer-two-vectors
        COMMAND ${ALGOVIZ_NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tests/verify-analysis.mjs
                ${CMAKE_CURRENT_BINARY_DIR}/algoviz-analyzer
                ${PROJECT_SOURCE_DIR}/samples/arrays/two-vectors.cpp
                two-vectors
    )
    add_test(
        NAME algoviz-analyzer-no-vector
        COMMAND ${ALGOVIZ_NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tests/verify-analysis.mjs
                ${CMAKE_CURRENT_BINARY_DIR}/algoviz-analyzer
                ${PROJECT_SOURCE_DIR}/samples/arrays/no-vector.cpp
                no-vector
    )
    add_test(
        NAME algoviz-analyzer-invalid-source
        COMMAND ${ALGOVIZ_NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tests/verify-analysis.mjs
                ${CMAKE_CURRENT_BINARY_DIR}/algoviz-analyzer
                ${PROJECT_SOURCE_DIR}/samples/invalid/syntax-error.cpp
                invalid
    )
endif()
