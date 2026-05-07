import  Navbar2  from "@/src/widgets/navbar2/ui/Navbar2"

export default function NewRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar2 />
      {children}
    </>
  )
}