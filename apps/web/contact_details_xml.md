<page pageID="contactsDetails" type="Details" tableName="contacts" pageTitle="Contact Detail" mainFieldIDs="full_name,email">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Identity & Preferences">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="full_name" displayName="Full Name" tooltip="Contact’s full name."/>

   <field id="email" displayName="Email" tooltip="Primary email for the contact."/>

   <field id="phone" displayName="Phone" tooltip="Primary phone number for the contact."/>

   <field id="preferred_contact_method" displayName="Preferred Contact Method" tooltip="How this contact prefers to be reached (e.g., email, phone, text)."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this contact (not visible externally)."/>

  </subSection>



  <!-- If you have already included every non-audit field above, leave this note: -->

  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->

 <pageSection type="child_tab" name="Athlete Relationships">

  <component type="ListView" tableName="contact_athletes" createButton="VISIBLE" editType="DETAILS">

   <field id="athlete_id" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Athlete linked to this contact.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <!-- <ref table="athletes" fieldID="phone"/> -->

     <!-- <ref table="athletes" fieldID="instagram_handle"/> -->

    </lookup>

   </field>

   <field id="relationship" displayName="Relationship" enableInlineEdit="FALSE" tooltip="How this contact is related to the athlete (e.g., parent, guardian)."/>

   <field id="is_primary" displayName="Primary?" enableInlineEdit="TRUE" tooltip="Mark as the primary contact for this athlete."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this relationship."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this contact relationship started."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this contact relationship ended, if applicable."/>



  </component>



  <page type="CreateForm" table="contact_athletes">

   <field id="contact_id" prefilledFromParent="true" displayName="Contact" tooltip="Prefilled link back to this contact.">

    <lookup>

     <ref table="contacts" fieldID="full_name"/>

     <ref table="contacts" fieldID="email"/>

     <!-- <ref table="contacts" fieldID="phone"/> -->

    </lookup>

   </field>

   <field name="athlete_id" displayName="Athlete" tooltip="Select the athlete to link with this contact.">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

     <ref table="athletes" field="[contact_email]"/>

     <!-- <ref table="athletes" field="[phone]"/> -->

    </lookup>

   </field>

   <field name="relationship" displayName="Relationship" tooltip="Describe how this contact is related to the athlete."/>

   <field name="is_primary" displayName="Primary?" tooltip="Set true if this is the main contact for the athlete."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this relationship."/>

  </page>



  <!-- Optional fields for a modal for editing. Only needed if the edit type is modal vs details-->

  <component type="EditModal" table="contact_athletes">

   <field name="athlete_id" displayName="Athlete" tooltip="Select the athlete to link with this contact.">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

     <ref table="athletes" field="[contact_email]"/>

    </lookup>

   </field>

   <field name="relationship" displayName="Relationship" tooltip="Describe how this contact is related to the athlete."/>

   <field name="is_primary" displayName="Primary?" tooltip="Mark as the primary contact for this athlete."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this relationship."/>

  </component>



 </pageSection>

</page>

