cmake_minimum_required(VERSION 3.10)
project(lightning-build-ui LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ImGui sources
set(IMGUI_DIR ${CMAKE_SOURCE_DIR}/libs/imgui)
set(IMGUI_SOURCES
    ${IMGUI_DIR}/imgui.cpp
    ${IMGUI_DIR}/imgui_draw.cpp
    ${IMGUI_DIR}/imgui_tables.cpp
    ${IMGUI_DIR}/imgui_widgets.cpp
    ${IMGUI_DIR}/backends/imgui_impl_glfw.cpp
    ${IMGUI_DIR}/backends/imgui_impl_opengl3.cpp
)

# App sources
set(APP_SOURCES
    src/main.cpp
    src/app.cpp
    src/build_runner.cpp
)

# Platform-specific configurations
if(WIN32)
    # Windows native or cross-compilation (MinGW)
    set(GLFW_WIN_DIR ${CMAKE_SOURCE_DIR}/libs/glfw_win)

    add_executable(${PROJECT_NAME} WIN32 ${APP_SOURCES} ${IMGUI_SOURCES})

    target_include_directories(${PROJECT_NAME} PRIVATE
        ${IMGUI_DIR}
        ${IMGUI_DIR}/backends
        ${CMAKE_SOURCE_DIR}/libs/json
        ${CMAKE_SOURCE_DIR}/src
        ${GLFW_WIN_DIR}/include
    )

    # Static link GLFW for Windows (MinGW)
    find_library(GLFW_LIB NAMES glfw3 libglfw3 PATHS ${GLFW_WIN_DIR}/lib-mingw-w64)
    target_link_libraries(${PROJECT_NAME} PRIVATE 
        ${GLFW_LIB}
        opengl32
        gdi32
        shell32
    )

    # Hide console window on Windows
    target_link_options(${PROJECT_NAME} PRIVATE -mwindows)
    
else()
    # Linux build
    add_executable(${PROJECT_NAME} ${APP_SOURCES} ${IMGUI_SOURCES})

    target_include_directories(${PROJECT_NAME} PRIVATE
        ${IMGUI_DIR}
        ${IMGUI_DIR}/backends
        ${CMAKE_SOURCE_DIR}/libs/json
        ${CMAKE_SOURCE_DIR}/src
    )

    find_package(glfw3 3.3 REQUIRED)
    find_package(OpenGL REQUIRED)

    target_link_libraries(${PROJECT_NAME} PRIVATE
        glfw
        OpenGL::GL
        dl
        pthread
    )
endif()

target_compile_options(${PROJECT_NAME} PRIVATE -O2 -Wall)

