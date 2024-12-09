import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidColor } from "@/utils/colors";
import { cn } from "@/lib/utils";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPickerInput = ({ label, value, onChange, className }: ColorPickerInputProps) => {
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
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          className="h-8 w-12 p-0.5 transition-all duration-200 focus:scale-[1.02] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none max-w-[100px] sm:max-w-[150px]"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          className="flex-1 max-w-[120px]"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export default ColorPickerInput;