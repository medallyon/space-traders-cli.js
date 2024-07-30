/**
 * Turn a number into a string with commas separating the thousands.
 * @param numberToFormat The number to format.
 * @return The formatted number. For example, 1000000 becomes "1,000,000".
 */
function numberWithCommas(numberToFormat: number)
{
	return numberToFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default numberWithCommas;
