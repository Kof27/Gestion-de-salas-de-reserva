import { AppSidebar } from "@/src/features/sidebar/SidebarRoom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Plus  } from 'lucide-react';
import { Button } from "@/components/ui/button";

function RoomPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="bg-[#F8F6F6] w-full min-h-screen flex flex-col">
          <div className="flex justify-between items-center mt-8 ml-8 mr-8 ">
            <div>
              <h1 className="text-4xl font-bold text-[#0F172A]">
                Gestión de Salas de Reuniones
              </h1>
              <p className="text-[#64748B] text-sm">
                Administrar espacios para la Facultad de Ingeniería
              </p>
            </div>
            <Button variant="default" className="h-10 w-40 bg-red-600 hover:bg-red-700">
              <Plus  className="mr-2 h-4 w-4" />
              Agregar Sala
            </Button>
          </div>
          <div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { RoomPage };
