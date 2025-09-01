// src/quiz/PreflopHelp.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PreflopHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="px-1">Памятка</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Префлоп — что тренируем</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <b>1) Пот-оддсы (порог колла).</b> Формула: <code>toCall / (potBefore + toCall)</code>.  
            Тренируем оценку в целых %, допускаем погрешность: новичок ±2%, базово ±1%, продвинуто ±0.5%.
          </div>
          <div>
            <b>2) MDF (минимальная частота защиты).</b> <code>MDF = Pot / (Pot + Bet)</code>.  
            Показывает, какую долю диапазона (колл + 3-бет) нужно продолжать, чтобы не давать авто-профит сайзу.
          </div>
          <div>
            <b>3) Разделение продолжений.</b> Вэлью 3-беты против широких опенов; блеф-3-беты с блокерами (A5s–A2s); остальное — колл по играбельности (пары, suited Ax/Kx, коннекторы).
          </div>
          <div>
            <b>4) Базовые эвристики.</b> BB против маленьких сайзов защищает шире; против ранних позиций — уже; SB против BTN чаще 3bet/fold.
          </div>
          <div>
            <b>5) Мультивэй и сквиз.</b> После опена и колд-колла предпочитаем сквиз (есть «мёртвые деньги»); слабые оффсьют-коллы OOP мультивэй — чаще фолд.
          </div>
          <div className="opacity-75">
            По умолчанию тренируем 6-max, 100bb, без анте. Сайзы: open 2.0–3.0x; 3-бет ~3x IP / ~3.5x OOP; 4-бет ~2.2x.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
