import React from "react";
export const TemplateSkeleton: React.FC = () => {
  return (
    <div className="aspect-[4/5] rounded-2xl bg-black/[0.03] animate-pulse border border-border" />
  );
};
export const TemplatesPageSkeleton: React.FC<{ title: string }> = ({
  title,
}) => {
  return (
    <div className="p-8 w-full animate-fade-in">
      {" "}
      <div className="mb-10">
        {" "}
        <h1 className="text-4xl font-bold mb-4">{title}</h1>{" "}
        <div className="h-6 w-64 bg-black/[0.03] animate-pulse rounded mb-2" />{" "}
      </div>{" "}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {" "}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-black/[0.03] animate-pulse rounded-full flex-shrink-0"
          />
        ))}{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {" "}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <TemplateSkeleton key={i} />
        ))}{" "}
      </div>{" "}
    </div>
  );
};
