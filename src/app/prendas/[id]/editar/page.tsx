"use client";

import GarmentForm from "@/components/GarmentForm";
import { useParams } from "next/navigation";

export default function EditGarmentPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div>
            <GarmentForm id={id} />
        </div>
    );
}
