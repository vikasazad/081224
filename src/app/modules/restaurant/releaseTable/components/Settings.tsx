"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import {
  getLiveTableData,
  handleTableRemoval,
} from "../../utils/restaurantDataApi";

const Settings = () => {
  //   console.log("dataaaaaaaaaaaaaaaa", data);
  useEffect(() => {
    getLiveTableData().then((data: any) => {
      console.log("dataaaaaaaaaaaaaaaa", data);
      if (data.length > 0) {
        setTableNumbers(data);
      }
    });
  }, []);
  const [tableNumbers, setTableNumbers] = useState<string[]>([]);
  const [tableRemoveDialog, setTableRemoveDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>({});

  const handleTableRemove = (table: any) => {
    console.log("table", table);
    setSelectedTable(table);
    setTableRemoveDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      await handleTableRemoval(selectedTable);
      // Remove the table from the local state
      setTableNumbers((prev) =>
        prev.filter((table: any) => table.location !== selectedTable.location)
      );
      setTableRemoveDialog(false);
      setSelectedTable({});
    } catch (error) {
      console.error("Error removing table:", error);
      setTableRemoveDialog(false);
      setSelectedTable({});
    }
  };

  const handleCancelRemove = () => {
    setTableRemoveDialog(false);
    setSelectedTable({});
  };

  return (
    <>
      <Card className="max-w-4xl mx-8 my-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tableNumbers.length > 0 && (
            <div id="remove-table">
              <span className="text-md font-semibold mb-2">
                Remove Table(Only to be done when table owner is not identified)
              </span>

              <div>
                {tableNumbers.length > 0 &&
                  tableNumbers.map((tableNumber: any) => (
                    <div
                      className="flex items-center justify-between"
                      key={tableNumber.location}
                    >
                      <span>T-{tableNumber.location}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleTableRemove(tableNumber)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={tableRemoveDialog} onOpenChange={setTableRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Table Removal</DialogTitle>
            <DialogDescription>
              This action can only be performed if the table owner is not
              identified. Are you sure you want to remove table T-
              {selectedTable.location}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRemove}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;
