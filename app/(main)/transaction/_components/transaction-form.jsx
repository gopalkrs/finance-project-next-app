"use client";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createTransaction } from "@/actions/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/CreateAccoutDrawer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReceiptScanner } from "./receipt-scanner"

const AddTransactionForm = ({ accounts, categories }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts?.find((ac) => ac.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionData,
    error,
  } = useFetch(createTransaction);

  const type = watch("type");
  const amount = watch("amount");
  const date = watch("date");
  const accountId = watch("accountId");
  const isRecurring = watch("isRecurring");

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    transactionFn(formData);
  };

  useEffect(() => {
    if (transactionData?.success && !transactionLoading) {
      toast.success("Transaction created successfully");
      reset();
      router.push(`/account/${transactionData?.data.accountId}`);
    }
  }, [transactionData, transactionLoading]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleScanComplete = (scannedData) => {
    setValue("amount", scannedData.amount);
    setValue("date", scannedData.date);
    
    if(scannedData.description){
      setValue("description", scannedData.description);
    }
    if(scannedData.category){
      setValue("category", scannedData.description)
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI Receipt scanner */}

      <ReceiptScanner onScanComplete={handleScanComplete} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            {...register("amount")}
            placeholder="0.00"
            step={"0.01"}
          />

          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account Id</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={accountId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account Type" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  className="w-full items-center select-none text-sm outline-none"
                  variant="ghost"
                >
                  Create New Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="w-full text-left pl-3 font-normal"
              variant={"outline"}
            >
              {date ? format(date, "PPP") : <span>Pick a date : </span>}
              <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("01-01-1900")
              }
              className="rounded-md border"
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input {...register("description")} placeholder="Enter Description" />

        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg p-3 border">
        <div>
          <label
            className="text-sm font-medium cursor-pointer"
            htmlFor="isRecurring"
          >
            Recurring Transaction
          </label>

          <p className="text-sm text-muted-foreground">
            Set this transaction as a recurring transaction
          </p>
        </div>
        <Switch
          id="isRecurring"
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={watch("isRecurring")}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          className="w-full"
          variant={"outline"}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={transactionLoading}>
          Create Transaction
        </Button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
