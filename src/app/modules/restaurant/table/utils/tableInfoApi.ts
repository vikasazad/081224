"use server";
import { auth } from "@/auth";
import { db } from "@/config/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function saveTableInfo(tableData: any, tableType: string) {
  const session = await auth();
  const user = session?.user?.email;

  if (!user) {
    console.error("User email is undefined");
    return false;
  }

  try {
    const docRef = doc(db, user, "restaurant");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data().tables;
      const existingTableNumbers = new Set<string>();
      data.forEach((tableGroup: any) => {
        Object.entries(tableGroup).forEach(([type, tables]) => {
          if (type !== tableType && Array.isArray(tables)) {
            tables.forEach((table: any) => {
              if (Array.isArray(table.tableNumber)) {
                table.tableNumber.forEach((num: string) =>
                  existingTableNumbers.add(num)
                );
              }
            });
          }
        });
      });

      // Check for conflicts with new table numbers
      const hasConflict = tableData.tableNumber.some((num: string) =>
        existingTableNumbers.has(num)
      );

      if (hasConflict) {
        // console.error(
        //   "Table number conflict detected. Some table numbers are already in use by tables with different seating capacity."
        // );
        return {
          success: false,
          error:
            "Table number conflict: One or more table numbers are already assigned to tables with different seating capacity.",
        };
      }

      // If no conflicts, proceed with update
      const updatedTables = data.map((tableGroup: any) => {
        if (tableGroup[tableType]) {
          tableGroup[tableType] = [tableData];
        }
        return tableGroup;
      });

      if (tableData.tableNumber) {
        const tables = tableData.tableNumber.map((item: any) => {
          return {
            location: item,
            status: "available",
            capacity:
              tableType === "twoseater"
                ? 2
                : tableType === "fourseater"
                ? 4
                : 6,
            cleaning: {
              lastCleaned: "",
              cleanedBy: "",
              startTime: "",
              endTime: "",
            },
            maintenance: {
              issue: "",
              description: "",
              startTime: "",
              endTime: "",
              fixedBy: "",
            },
          };
        });
        console.log("data", tables);
        await updateDoc(docRef, {
          [`live.tablesData.tableDetails.${tableType}`]: tables, // Fixed dynamic field
        });
      }

      await updateDoc(docRef, {
        tables: updatedTables,
      });

      return {
        success: true,
        message: "Table information updated successfully",
      };
    } else {
      // console.error("Document does not exist.");
      return {
        success: false,
        error: "Document does not exist",
      };
    }
  } catch {
    // console.error("ERROR setting offline data:", error);
    return {
      success: false,
      error: "Failed to update table information",
    };
  }
}
