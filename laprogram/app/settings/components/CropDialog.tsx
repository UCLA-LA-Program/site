"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = area.width;
      canvas.height = area.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        img,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        area.width,
        area.height,
      );
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas error"))),
        "image/png",
      );
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function CropDialog({
  src,
  onConfirm,
  onClose,
}: {
  src: string;
  onConfirm: (blob: Blob, previewUrl: string) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedArea) return;
    const blob = await getCroppedBlob(src, croppedArea);
    onConfirm(blob, URL.createObjectURL(blob));
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Headshot</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-md">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
