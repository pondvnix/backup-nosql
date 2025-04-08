
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface WordConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  word: string;
}

const WordConfirmDeleteModal = ({ isOpen, onClose, onConfirm, word }: WordConfirmDeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบคำ
          </DialogTitle>
          <DialogDescription>
            คุณต้องการลบคำนี้ออกจากฐานข้อมูลใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-center font-medium text-lg">"{word}"</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            การลบคำนี้จะทำให้แม่แบบประโยคทั้งหมดที่เกี่ยวข้องหายไปด้วย
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            ลบคำนี้
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordConfirmDeleteModal;
