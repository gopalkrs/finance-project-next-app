"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMonths, format } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { categoryColors } from "@/data/category";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { deleteBulkTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

const TransactionTable = ({ transactions }) => {

  const router = useRouter();
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "asc",
  });

  const handleSorting = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const {
    loading : deleteLoading,
    data : deleted,
    fn : deletedFn
  } = useFetch(deleteBulkTransactions);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredSortedTransactions.length
        ? []
        : filteredSortedTransactions.map((t) => t.id)
    );
  };

  const bulkDeleteHandler = () => {
    if(!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions`)){
      return;
    }
    deletedFn(selectedIds);
    handleClearFilters();

  };

  useEffect(() => {
    if(deleted && !deleteLoading){
      toast.error("Deleted the transactions successfully.")
    }
  }, [deleteLoading, deleted])
  

  const filteredSortedTransactions = useMemo(()=>{
  
    let result = [...transactions];

    if(searchTerm){
      const searchValue = searchTerm.toLowerCase();
      result = result.filter((transaction)=>
        transaction.description?.toLowerCase().includes(searchValue)
      )
    }

    if(typeFilter){
      return result.filter((transaction)=>transaction.type=typeFilter)
    }

    if(recurringFilter){
      return result.filter((transaction)=>{
        if(recurringFilter === "recurring")
          return transaction.isRecurring
        else
          return !transaction.isRecurring
      })
    }

    //apply sorting

    result.sort((a,b)=>{
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount" :
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          break;
      }
      return sortConfig.direction === "asc"? comparison : -comparison;
    })

    return result;
  },[searchTerm, typeFilter, recurringFilter, sortConfig, transactions]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };


  return (
    <div className="space-y-4">
      {deleteLoading && 
        (<BarLoader width={'100%'} className="mt-4" color="#9333ea"/>)
      }
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search transactions...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(value)=>setTypeFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        
          <Select value={recurringFilter} onValueChange={(value)=>setRecurringFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Transaction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button variant={"destructive"} onClick={bulkDeleteHandler}>
              <Trash className="h-4 w-4 " /> 
              Delete selected ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && 
            <Button variant={"outline"} size="icon" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          
          }
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === filteredSortedTransactions.length &&
                    filteredSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSorting("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 w-4 h-4" />
                    ) : (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSorting("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 w-4 h-4" />
                    ) : (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSorting("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 w-4 h-4" />
                    ) : (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-muted-foreground"
                  colSpan={7}
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="rounded-md px-2 py-1 text-sm text-white"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.type === "EXPENSE" ? "-" : "+"} &#8377;
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={"outline"}
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <RefreshCcw className="h-3 w-3" />
                              {transaction.recurringInterval.charAt(0) +
                                transaction.recurringInterval
                                  .slice(1)
                                  .toLowerCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>
                              <div>Next Date :</div>
                              <div>
                                {format(new Date(transaction.lastProcessed), "PP")}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant={"outline"} className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transactions/create/edit?${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deletedFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
