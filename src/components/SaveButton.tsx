"use client";

import { Save } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { useFlip } from "@/contexts/FlipContext";

export default function SaveButton() {
    const { saveHistory } = useFlip();

    const [saving, setSaving] = useState<boolean>(false);

    const handleSave = async () => {
        setSaving(true);
        console.log("saved")
        await saveHistory();
        setSaving(false);
    }

    if (saving) {
        return (
            <Button className="fixed top-4 right-4 rounded-full" disabled size="icon-lg"><Spinner /></Button>
        )
    } else {
        return (
            <Button className="fixed top-4 right-4 rounded-full hover:cursor-pointer" size="icon-lg" onClick={handleSave}><Save /></Button>
        )
    }
}