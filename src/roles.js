// server/roles.js
const AccessControl = require("accesscontrol");
const ac = new AccessControl();
 
exports.roles = (function() {
ac.grant("basic")
.readOwn("profile")
.updateOwn("profile")
 
ac.grant("supervisor")
.extend("basic")
.readAny("profile")
 
ac.grant("admin")
.extend("basic")
.extend("supervisor")
.updateAny("profile")
.deleteAny("profile")

const permission = ac.can('user').createOwn('video');
console.log(permission.granted);    // —> true
console.log(permission.attributes); // —> ['*'] (all attributes)
 
permission = ac.can('admin').updateAny('video');
console.log(permission.granted);    // —> true
console.log(permission.attributes); // —> ['title']
 
return ac;
})();