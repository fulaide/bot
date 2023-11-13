
export async function formatCurrency(value, currencySymbol = "$") {
    try {
        // Split integer and decimal parts if there is a decimal point
        const parts = value.toString().split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? parts[1] : "";

        // Determine the number of decimal places based on the value
        const numDecimalPlaces = parseInt(integerPart) > 0 ? 2 : 5;

        // Limit decimal part to the specified number of digits
        let formattedDecimalPart = "";
        if (decimalPart && decimalPart.length > numDecimalPlaces) {
            formattedDecimalPart = decimalPart.substring(0, numDecimalPlaces);
        } else {
            formattedDecimalPart = decimalPart;
        }

        // Format integer part with commas
        let formattedIntegerPart = "";
        for (let i = integerPart.length; i > 0; i -= 3) {
            formattedIntegerPart =
            "," + integerPart.substring(Math.max(i - 3, 0), i) + formattedIntegerPart;
        }


        // Remove leading comma if present
        if (formattedIntegerPart && formattedIntegerPart[0] === ",") {
            formattedIntegerPart = formattedIntegerPart.substring(1);
        }

        // Combine integer and decimal parts with appropriate separator
        const formattedValue =
        formattedIntegerPart + (formattedDecimalPart ? "." + formattedDecimalPart : "");

        // Add the currency symbol and return the formatted string
        return `${currencySymbol} ${formattedValue}`;

    } catch (error) {
        console.log(`Error: ${error.message}`);
        return null
    }
}

export async function formatShimmerAmount(value) {
    try {
        console.log("Formatting glow to SMR");
        // Convert the number to a float and then format it with 2 decimal places
        const formattedValue = (parseFloat(value) / 1000000).toFixed(2);
        return formattedValue;
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return null;
    }
}