"use client";

import OrderForm from "@/components/OrderForm";
import { useParams } from "next/navigation";

export default function EditOrderPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div>
            <OrderForm id={id} />
        </div>
    );
}
