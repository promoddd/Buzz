import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Settings from "./Settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  userData: {
    name: string;
    nameColor: string;
    titleColor?: string;
    lastNameChange?: string;
    badge?: {
      text: string;
      color: string;
    };
  };
  onSignOut: () => void;
}

const Header = ({ userData, onSignOut }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b transition-all duration-300">
      <h1 
        className="text-2xl font-bold tracking-tight transition-colors duration-300"
        style={{ color: userData.titleColor || 'inherit' }}
      >
        Buzz
      </h1>
      <div className="flex items-center gap-4">
        <Settings userData={userData} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="transition-transform duration-200 hover:scale-110"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="transition-all duration-200 hover:scale-105"
            >
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out, {userData.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={onSignOut}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Header;