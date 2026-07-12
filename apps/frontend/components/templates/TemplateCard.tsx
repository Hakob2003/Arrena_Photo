import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Template } from "../../types/template.types";
interface TemplateCardProps {
  template: Template;
  index: number;
  isLuxury: boolean;
}
export const TemplateCard: React.FC<TemplateCardProps> = ({
  template: tpl,
  index,
  isLuxury,
}) => {
  const router = useRouter();
  const fallbackCover =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/generate?templateId=${tpl.id}`)}
      className="group glass-card rounded-2xl overflow-hidden cursor-pointer relative"
    >
      {" "}
      {tpl.price !== undefined && tpl.price !== null && (
        <div
          className={`absolute top-4 right-4 z-20 backdrop-blur-none px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${isLuxury ? "bg-[#D4AF37]/90 text-foreground shadow-none" : "bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none/90 text-white"}`}
        >
          {" "}
          <span>⚡ {tpl.price}</span>{" "}
          {tpl.oldPrice !== undefined &&
            tpl.oldPrice !== null &&
            tpl.price > tpl.oldPrice && (
              <span title={`Previously ${tpl.oldPrice}`}>
                {" "}
                <ArrowUp className="w-3 h-3 text-red-300" />{" "}
              </span>
            )}{" "}
          {tpl.oldPrice !== undefined &&
            tpl.oldPrice !== null &&
            tpl.price < tpl.oldPrice && (
              <span title={`Previously ${tpl.oldPrice}`}>
                {" "}
                <ArrowDown className="w-3 h-3 text-green-300" />{" "}
              </span>
            )}{" "}
        </div>
      )}{" "}
      <div className="aspect-[4/5] relative overflow-hidden bg-black/[0.03]">
        {" "}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />{" "}
        <img
          src={tpl.coverUrl || fallbackCover}
          alt={tpl.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />{" "}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          {" "}
          <span
            className={`text-xs font-bold uppercase tracking-wider ${isLuxury ? "text-[#D4AF37]" : "text-indigo-400"}`}
          >
            {tpl.category?.name || "Uncategorized"}
          </span>{" "}
          <h3 className="text-lg font-bold text-foreground mt-1">
            {tpl.name}
          </h3>{" "}
        </div>{" "}
      </div>{" "}
    </motion.div>
  );
};
