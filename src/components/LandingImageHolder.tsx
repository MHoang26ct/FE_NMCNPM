import cnpmBankImg from "@/assets/CNPMNBANK.jpeg";

export function LandingImageHolder() {
  return (
    <div className="w-full flex-1 min-h-0 bg-muted flex items-center justify-center overflow-hidden">
      <img src={cnpmBankImg} alt="CNPM BANK" className="w-full h-full object-cover" />
    </div>
  );
}
