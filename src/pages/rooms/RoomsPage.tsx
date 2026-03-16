import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

function RoomPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
        <div className="bg-[#E2E8F0] w-full min-h-screen flex items-center justify-center">

        </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export {RoomPage};