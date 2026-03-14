/**
 * Generates a VCF string from an array of contacts.
 * Maps:
 * - name -> FN
 * - phone -> TEL;TYPE=CELL
 * - email -> EMAIL
 * - address -> ADR;TYPE=HOME
 * - birthday -> BDAY
 * - id -> UID (uuid as requested)
 * - createAt, updateAt, isArchive -> REV, meta
 */
export function generateVCF(contacts: Contact[]): string {
	return contacts.map(contact => {
		const vcard = [
			"BEGIN:VCARD",
			"VERSION:3.0",
			`FN:${contact.name || ""}`,
			`TEL;TYPE=CELL:${contact.phone || ""}`,
			contact.email ? `EMAIL:${contact.email}` : "",
			contact.address ? `ADR;TYPE=HOME:;;${contact.address.replace(/\n/g, ";")}` : "",
			contact.birthday ? `BDAY:${contact.birthday}` : "",
			`REV:${contact.updatedAt || contact.createdAt || new Date().toISOString()}`,
			`UID:${contact.id}`,
			contact.isArchive ? "X-ARCHIVED:TRUE" : "",
			"END:VCARD"
		].filter(line => !!line).join("\n");
		return vcard;
	}).join("\n");
}
