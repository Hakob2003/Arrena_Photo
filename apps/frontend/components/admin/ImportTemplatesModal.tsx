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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Import Templates</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste a JSON array or a TSV/CSV (from Excel/Google Sheets).
            Required headers: <strong>Name, Category, Prompt</strong>.
            Optional: <strong>Description, Preview URL (Cover Image), Negative Prompt, Price, Status, Recommended Models</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Upload File (.csv, .tsv, .json)</Label>
            <input 
              type="file" 
              accept=".csv,.json,.tsv,.txt" 
              onChange={handleFileUpload} 
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-foreground hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="data">Or Paste Data (JSON or TSV/CSV)</Label>
            <Textarea
              id="data"
              placeholder={'[\n  {\n    "name": "Template 1",\n    "categoryName": "Business",\n    "prompt": "A professional portrait..."\n  }\n]\n\nOR\n\nName,Category,Prompt,Price (Credits)\nTemp1,Business,Portrait of...,10'}
              className="bg-background border-border font-mono text-xs"
              rows={15}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading} className="text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-foreground">
            {loading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
