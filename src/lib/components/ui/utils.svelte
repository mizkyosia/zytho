<script lang="ts" module>
    import { editDeliveryLine } from "../../../routes/remote/delivery.remote";
    import { editZythoLine } from "../../../routes/remote/zytho.remote";
    import { Input } from "./input";

    type Delivery = {
      id: number;
      price: number;
      date: Date;
    }

    type DeliveryLine = {
        id: number;
        count: number;
    };
    type ZythoLine = {
        countBefore: number;
        countAfter: number;
        id: number;
    };

    type NumberStrRecord = {
        [x: string]: number | string;
    };

    export { updateDeliveryRow, updateZythoRow };
</script>

{#snippet updateZythoRow<T extends ZythoLine>({
    column,
    row,
}: {
    column: keyof T;
    row: T;
})}
    <Input
        type="number"
        value={row[column]}
        class="w-20"
        onchange={(e) => {
            let oldValue = row[column];
            if (typeof row[column] === "number")
                row[column] = e.currentTarget.valueAsNumber;
            else row[column] = e.currentTarget.value;
            editZythoLine({
                id: row.id,
                [column]: row[column],
            }).catch((e) => {
                // Rollback
                row[column] = oldValue;
            });
        }}
    />
{/snippet}

{#snippet updateDeliveryRow(row: DeliveryLine)}
    <Input
        type="number"
        value={row.count}
        class="w-20"
        onchange={(e) => {
            let oldValue = row.count;
            row.count = e.currentTarget.valueAsNumber;
            editDeliveryLine({
                id: row.id,
                count: e.currentTarget.valueAsNumber,
            }).catch((e) => {
                // Rollback
                row.count = oldValue;
            });
        }}
    />
{/snippet}

<!-- {#snippet updateRow<T>({row, column, action}: {row: T; column: keyof T; action: () => void;})}
    <Input type="number" value={row[column]} class="w-20" onchange={(e) => {
      let oldValue = row[column];
      row.count = e.currentTarget.valueAsNumber;
      editDeliveryLine({
        id: row.id,
        count: e.currentTarget.valueAsNumber
      }).catch(e => {
        // Rollback
        row.count = oldValue;
      });

    }} />
{/snippet} -->
