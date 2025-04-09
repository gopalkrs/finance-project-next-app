"use client";
import React, { useEffect, useRef } from "react";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendReceipt } from "@/actions/transaction";


export function ReceiptScanner({ onScanComplete }) {
  const fileRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    data: scanReceiptData,
    fn: scanReceiptFn,
    error,
  } = useFetch(sendReceipt);

  const handleReceiptscan = async(file) =>{
    if(file.size > 5*1024*1024){
      toast.error("File size should be less than 5 mb");
      return;
    }
    await scanReceiptFn(file);
  }

  useEffect(() => {
    if(scanReceiptData && !scanReceiptLoading){
      onScanComplete(scanReceiptData);
      toast.success("Receipt scanned successfully.")
    }
  }, [scanReceiptData, scanReceiptLoading])
  

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptscan(file);
        }}
        accept="image/*"
        capture="environment"
      />

      <Button
      type="button"
        variant={"outline"}
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 
        hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={()=>fileRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
