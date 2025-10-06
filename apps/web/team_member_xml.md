<page id="internalTeamList" displayName="Team Members" editType="DETAILS">

  <component type="ListView" table="internal_team" createButton="VISIBLE">

   <!-- Choose 3–5 high-signal fields users filter by -->

   <field name="name" />

   <field name="job_title"/>

   <field name="timezone"/>



   <!-- Foreign key example with lookup -->

   <field name="user_id" displayName="Linked User" enableInlineEdit="FALSE">

    <lookup>

      <ref table="user" field="id"/>

      <ref table="user" field="email"/>

      <!-- <ref table="user" field="full_name"/> -->

    </lookup>

   </field>

  </component>

</page>

