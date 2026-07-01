export type AppRole = "Admin" | "Student" | "Lecturer";

export function getDashboardPath(role?: string | null) {
    if (role === "Admin") return "/admin/dashboard";
    if (role === "Lecturer") return "/lecturer/dashboard";
    return "/student/dashboard";
}

export function getRoleLabel(role?: string | null) {
    if (role === "Admin") return "Admin";
    if (role === "Lecturer") return "Lecturer";
    return "Student";
}
