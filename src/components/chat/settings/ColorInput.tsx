import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidColor } from "@/utils/colors";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => {
  const { toast } = useToast();

  const handleColorChange = (color: string) => {
    if (!isValidColor(color)) {
      toast({
        title: "Invalid Color",
        description: "Pure black and white colors are not allowed",
        variant: "destructive"
      });
      return;
    }
    onChange(color);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Input
        type="color"
        value={value}
        onChange={(e) => handleColorChange(e.target.value)}
        className="h-8 w-12 p-0.5 transition-all duration-200 focus:scale-[1.02]"
      />
    </div>
  );
};

export default ColorInput;