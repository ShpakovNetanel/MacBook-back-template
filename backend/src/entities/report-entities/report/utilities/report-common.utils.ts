import { isDeepEqual } from "remeda"

export const hasHierarchyChanged = (
    screenLowerUnits: number[],
    dbLowerUnits: number[],
    returnValue: any[]
) => {
    if (!isDeepEqual(screenLowerUnits.sort(), dbLowerUnits.sort())) {
        return { message: `היררכיה תחתיך השתנתה`, returnValue, changed: true }
    }

    return { returnValue, changed: false }
}