if(DEFINED ENV{LLVM_DIR})
    list(APPEND CMAKE_PREFIX_PATH "$ENV{LLVM_DIR}")
endif()

if(DEFINED ENV{Clang_DIR})
    list(APPEND CMAKE_PREFIX_PATH "$ENV{Clang_DIR}")
endif()

find_package(LLVM REQUIRED CONFIG)
find_package(Clang REQUIRED CONFIG)

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
