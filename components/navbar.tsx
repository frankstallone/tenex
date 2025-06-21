import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import { Separator } from './ui/separator'

export default function Navbar() {
  return (
    <header className="flex flex-col justify-center items-end p-4 gap-4 px-24">
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <Separator orientation="horizontal" />
    </header>
  )
}
