#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"
#include <GLFW/glfw3.h>
#include <cstdio>
#include <filesystem>
#include <chrono>
#include "app.h"

namespace fs = std::filesystem;

#ifdef _WIN32
#include <windows.h>
#define GLFW_EXPOSE_NATIVE_WIN32
#include <GLFW/glfw3native.h>
#endif

static void glfw_error_callback(int error, const char* description) {
    FILE* f = fopen("build-ui_crash.log", "a");
    if (f) { fprintf(f, "GLFW Error %d: %s\n", error, description); fclose(f); }
}

#ifndef _WIN32
int main(int, char**) {
#else
int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hInstPrev, LPSTR lpCmdLine, int nShowCmd) {
#endif
#ifdef _WIN32
    // Enable high DPI support
    typedef BOOL (WINAPI *SetProcessDpiAwarenessContextFn)(HANDLE);
    HMODULE user32 = GetModuleHandleA("user32.dll");
    if (user32) {
        auto fn = (SetProcessDpiAwarenessContextFn)GetProcAddress(user32, "SetProcessDpiAwarenessContext");
        if (fn) {
            fn((HANDLE)(intptr_t)-4);
        } else {
            SetProcessDPIAware();
        }
    }
#endif

    glfwSetErrorCallback(glfw_error_callback);
    if (!glfwInit()) { 
        FILE* f = fopen("build-ui_crash.log", "a"); fprintf(f, "FAIL: glfwInit\n"); fclose(f);
        return 1; 
    }
    FILE* dbg = fopen("build-ui_crash.log", "w");
    fprintf(dbg, "Step1: glfwInit OK\n");
    fflush(dbg);

    // Use OpenGL 3.0 without profile constraint for max compatibility
    const char* glsl_version = "#version 130";
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
    glfwWindowHint(GLFW_OPENGL_PROFILE, 0); // No profile constraint
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);
    glfwWindowHint(GLFW_DECORATED, GLFW_FALSE);
    glfwWindowHint(GLFW_DOUBLEBUFFER, GLFW_TRUE);

    // Get monitor info for DPI scaling
    float xscale = 1.0f, yscale = 1.0f;
    GLFWmonitor* monitor = glfwGetPrimaryMonitor();
    if (monitor) glfwGetMonitorContentScale(monitor, &xscale, &yscale);
    float dpiScale = xscale;

    const int BASE_W = 1100, BASE_H = 750;
    GLFWwindow* window = glfwCreateWindow(BASE_W, BASE_H,
        "Lightning Games Build Wizard", nullptr, nullptr);
    if (!window) { 
        fprintf(dbg, "FAIL: window create\n");
        fclose(dbg);
        glfwTerminate(); return 1; 
    }
    fprintf(dbg, "Step2: window OK\n");
    fflush(dbg);

    glfwMakeContextCurrent(window);
    fprintf(dbg, "Step3: context OK\n");
    fflush(dbg);
    
    // VSync for smooth rendering (1 = vsync, 0 = unlimited)
    glfwSwapInterval(1);

    // Optimize OpenGL state
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    glDisable(GL_LIGHTING);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO();
    io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
    io.IniFilename = nullptr;
    io.LogFilename = nullptr;

    // Font loading with caching
    ImFont* fontRegular   = nullptr;
    ImFont* fontHeadline  = nullptr;
    ImFont* fontSubHeader = nullptr;
    ImFont* fontMono      = nullptr;

#ifdef _WIN32
    const char* segoeui  = "C:\\Windows\\Fonts\\segoeui.ttf";
    const char* segoeuib = "C:\\Windows\\Fonts\\segoeuib.ttf";
    const char* segoeuili = "C:\\Windows\\Fonts\\segoeuili.ttf";
    const char* cascadia = "fonts/CascadiaCode.ttf";

    if (fs::exists(cascadia)) {
        fontRegular   = io.Fonts->AddFontFromFileTTF(cascadia,  16.0f * dpiScale);
        fontHeadline  = io.Fonts->AddFontFromFileTTF(cascadia,  26.0f * dpiScale);
        fontSubHeader = io.Fonts->AddFontFromFileTTF(cascadia,  20.0f * dpiScale);
        fontMono      = io.Fonts->AddFontFromFileTTF(cascadia,  14.0f * dpiScale);
    } else if (fs::exists(segoeuib)) {
        fontRegular   = io.Fonts->AddFontFromFileTTF(segoeui,  16.0f * dpiScale);
        fontHeadline  = io.Fonts->AddFontFromFileTTF(segoeuib, 26.0f * dpiScale);
        fontSubHeader = io.Fonts->AddFontFromFileTTF(segoeuib, 20.0f * dpiScale);
        if (fs::exists(segoeuili)) {
            fontMono = io.Fonts->AddFontFromFileTTF(segoeuili, 14.0f * dpiScale);
        }
    } else if (fs::exists(segoeui)) {
        fontRegular   = io.Fonts->AddFontFromFileTTF(segoeui,  17.0f * dpiScale);
        fontHeadline  = io.Fonts->AddFontFromFileTTF(segoeui, 24.0f * dpiScale);
        fontSubHeader = io.Fonts->AddFontFromFileTTF(segoeui, 18.0f * dpiScale);
    }
#endif

    if (!fontRegular)   fontRegular   = io.Fonts->AddFontDefault();
    if (!fontHeadline)  fontHeadline  = fontRegular;
    if (!fontSubHeader) fontSubHeader = fontRegular;
    if (!fontMono)      fontMono      = fontRegular;

    // Build font atlas
    io.Fonts->Build();

    // Apply theme
    BuildApp::setupTheme();
    ImGuiStyle& style = ImGui::GetStyle();
    style.ScaleAllSizes(dpiScale);

    ImGui_ImplGlfw_InitForOpenGL(window, true);
    ImGui_ImplOpenGL3_Init(glsl_version);

    BuildApp app;
    app.init();
    app.setFonts(fontHeadline, fontSubHeader, fontRegular, fontMono);

    // Timing for smooth animations
    auto lastTime = std::chrono::high_resolution_clock::now();
    float deltaTime = 0.0f;

    // Main render loop - optimized for smooth 60fps
    while (!glfwWindowShouldClose(window)) {
        auto currentTime = std::chrono::high_resolution_clock::now();
        deltaTime = std::chrono::duration<float>(currentTime - lastTime).count();
        lastTime = currentTime;
        
        // Clamp delta time
        if (deltaTime > 0.1f) deltaTime = 0.1f;

        glfwPollEvents();
        
        // Handle minimized state
        if (glfwGetWindowAttrib(window, GLFW_ICONIFIED)) {
            glfwWaitEvents();
            continue;
        }

#ifdef _WIN32
        // Window dragging
        if (ImGui::GetIO().MousePos.y < 40 && ImGui::GetIO().MousePos.x < BASE_W - 40) {
            if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS) {
                HWND hwnd = glfwGetWin32Window(window);
                ReleaseCapture();
                SendMessage(hwnd, WM_NCLBUTTONDOWN, HTCAPTION, 0);
            }
        }
#endif

        // ImGui frame - wrap in try-catch
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();

        // Update app with delta time for smooth animations
        app.render((void*)window, deltaTime);

        // Render
        ImGui::Render();
        
        int dw, dh;
        glfwGetFramebufferSize(window, &dw, &dh);
        glViewport(0, 0, dw, dh);
        glClearColor(0.04f, 0.04f, 0.10f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
        glfwSwapBuffers(window);
    }

    ImGui_ImplOpenGL3_Shutdown();
    ImGui_ImplGlfw_Shutdown();
    ImGui::DestroyContext();
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
