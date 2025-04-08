
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบคำ
          </DialogTitle>
          <DialogDescription>
            การลบคำจะทำให้ข้อมูลแม่แบบประโยคที่เกี่ยวข้องหายไปด้วย
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>คุณต้องการลบคำว่า "<strong>{word}</strong>" ออกจากระบบหรือไม่?</p>
          <p className="text-sm text-muted-foreground mt-2">
            การกระทำนี้ไม่สามารถยกเลิกได้
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button variant="destructive" onClick={onConfirm}>ยืนยันการลบ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordConfirmDeleteModal;
