"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { templatesApi } from "@/lib/templates.api";
import Papa from "papaparse";

interface ImportTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportTemplatesModal({ isOpen, onClose, onSuccess }: ImportTemplatesModalProps) {
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!rawData.trim()) {
      toast.error("Please paste your data first");
      return;
    }

    try {
      setLoading(true);
      
      let parsedTemplates: any[] = [];
      
      // Try parsing as JSON first
      try {
        parsedTemplates = JSON.parse(rawData);
        if (!Array.isArray(parsedTemplates)) {
          throw new Error("JSON must be an array of objects");
        }
      } catch (jsonError) {
        // Fallback to TSV/CSV parsing with papaparse
        const parseResult = Papa.parse(rawData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // Automatically converts numbers/booleans
        });
        
        if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
          throw new Error("Failed to parse CSV/TSV data: " + parseResult.errors[0].message);
        }
        
        const headerMap: Record<string, string> = {
          'name': 'name',
          'category': 'categoryName',
          'categoryname': 'categoryName',
          'category name': 'categoryName',
          'preview url (cover image)': 'coverUrl',
          'coverurl': 'coverUrl',
          'preview url': 'coverUrl',
          'cover image': 'coverUrl',
          'price (credits)': 'price',
          'price': 'price',
          'description': 'description',
          'prompt': 'prompt',
          'negative prompt': 'negativePrompt',
          'negativeprompt': 'negativePrompt',
          'status': 'status',
          'recommended models': 'recommendedModels',
          'recommendedmodels': 'recommendedModels',
        };

        parsedTemplates = parseResult.data.map((row: any) => {
          const obj: any = {};
          // Clean up keys and map them to expected names
          for (const [key, val] of Object.entries(row)) {
            // Remove BOM character if present, trim and lowercase
            const cleanKey = key.replace(/^\uFEFF/, '').trim().toLowerCase();
            const mappedKey = headerMap[cleanKey] || key.trim(); // fallback to original trimmed key

            if (mappedKey === 'recommendedModels' && typeof val === 'string') {
              obj[mappedKey] = val.split(',').map(m => m.trim());
            } else if (mappedKey === 'price') {
              obj[mappedKey] = val !== null && val !== undefined && val !== '' ? Number(val) : 0;
            } else if (typeof val === 'string') {
              obj[mappedKey] = val.trim();
            } else {
              obj[mappedKey] = val;
            }
          }
          return obj;
        });
      }

      // Basic validation
      const validTemplates = parsedTemplates.filter(t => t.name && (t.categoryName || t.categoryId) && t.prompt);
      
      console.log('Parsed Templates:', parsedTemplates, 'Valid:', validTemplates);
      
      if (validTemplates.length === 0) {
        toast.error("No valid templates found. Ensure 'name', 'categoryName', and 'prompt' are provided.");
        setLoading(false);
        return;
      }

      const res = await templatesApi.importTemplates(validTemplates);
      toast.success(`Successfully imported ${res.imported} templates!`);
      setRawData("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to import templates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto !p-0 gap-0 overflow-hidden bg-white dark:bg-[#0a0a0c]">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 py-4">
          <DialogTitle className="text-xl font-semibold tracking-tight">Import Templates</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
            Paste a JSON array or a TSV/CSV. Required headers: <strong>Name, Category, Prompt</strong>.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300 font-medium">Upload File (.csv, .tsv, .json)</Label>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept=".csv,.json,.tsv,.txt" 
                onChange={handleFileUpload} 
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 cursor-pointer border border-gray-200 dark:border-white/10 rounded-lg p-1 bg-gray-50 dark:bg-black/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">OR PASTE DATA</span>
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="data" className="text-gray-700 dark:text-gray-300 font-medium">Raw Data (JSON or TSV/CSV)</Label>
            <Textarea
              id="data"
              placeholder={'[\n  {\n    "name": "Template 1",\n    "categoryName": "Business",\n    "prompt": "A professional portrait..."\n  }\n]'}
              className="bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-white/10 font-mono text-sm resize-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              rows={12}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md p-4 border-t border-gray-200 dark:border-white/10">
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
            {loading ? "Importing..." : "Import Templates"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
