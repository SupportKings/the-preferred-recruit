<page id="athleteApplicationsList" displayName="Athlete Applications" editType="DETAILS">

  <component type="ListView" table="athlete_applications" createButton="VISIBLE">

    <field name="athlete_id" displayName="Athlete">

    <lookup>

     <ref table="athletes" field="full_name"/>

     <ref table="athletes" field="graduation_year"/>

    </lookup>

   </field>

   <field name="university_id" displayName="University">

    <lookup>

     <ref table="universities" field="name"/>

     <ref table="universities" field="state"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program">

    <lookup>

     <ref table="programs" field="gender"/>

     <ref table="programs" field="team_url"/>

    </lookup>

   </field>

   <field name="stage" displayName="Stage"/>

<field id="start_date" displayName="Started" enableInlineEdit="FALSE"/>

<field id="offer_date" displayName="Offer Date" enableInlineEdit="FALSE"/>

<field id="commitment_date" displayName="Committed Date" enableInlineEdit="FALSE"/>

   <field name="last_interaction_at" displayName="Last Interaction"/>

  </component>

</page>

