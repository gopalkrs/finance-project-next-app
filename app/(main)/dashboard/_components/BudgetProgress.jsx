"use client";
import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import { Check, Pencil, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

    const {
        data : updatedBudget, 
        loading : isLoading, 
        error, 
        fn : updateBudgetFn
    } = useFetch(updateBudget);



    const handleUpdateBudget = () => {
        const amount = parseFloat(newBudget)
        if(isNaN(amount) || amount < 0 || amount < currentExpenses){
            toast.error("Please enter a valid amount")
            return;
        }
        updateBudgetFn(amount);
    }
    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
    }
    useEffect(() => {
      if(updatedBudget?.success){
        toast.success("Budget updated successfully");
        setIsEditing(false);
      }
    }, [updatedBudget])

    useEffect(() => {
        if(error){
          toast.error(error.message || "Failed to update budget")
          setIsEditing(false);
        }
      }, [error])
    

  return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="font-medium text-sm">Monthly Budget(Default Account)</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2" >
                  <Input
                    value={newBudget}
                    type="number"
                    onChange={(e)=>setNewBudget(e.target.value)}
                    className="w-32"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button variant="ghost" size={'icon'} disabled={isLoading} onClick={handleUpdateBudget}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size={'icon'} disabled={isLoading} onClick={handleCancel}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardDescription>
                    {initialBudget? `${currentExpenses.toFixed(2)} of ${initialBudget.amount.toFixed(2)} budget spent` : 
                    "No budget set"}
                  </CardDescription>
                  
                  <Button variant={'ghost'} onClick={()=>setIsEditing(true)} size={'icon'} className="h-6 w-6">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {initialBudget && (
                <div className="space-y-2">
                    <Progress value={percentageUsed} 
                    
                    />
                </div>
            )}
        </CardContent>
        <p className="text-muted-foreground text-xs text-right px-1">
            {percentageUsed.toFixed(2)}% used
        </p>
      </Card>
  );
};

export default BudgetProgress;
