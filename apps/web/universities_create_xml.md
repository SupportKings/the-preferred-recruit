<page id="universitiesCreate" type="Create" table="universities" name="Create University">

  <pageSection type="fields">



   <subSection name="Identity & Contact">

    <field name="name" displayName="University Name"/>

    <field name="email_blocked" displayName="Email Blocked"/>

   </subSection>



   <subSection name="Classifications">

    	<field name="type_public_private" displayName="Public/Private"/>

    	<field name="religious_affiliation" displayName="Religious Affiliation"/>



    <!-- Inline linked record: University Division -->

    <component type="LinkedRecordField" table="university_divisions" parentField="university_id" prefilledFromParent="true">

     <field name="division_id" displayName="Current Division">

      <lookup>

       <ref table="divisions" field="name"/>

       <ref table="governing_bodies" field="name"/>

      </lookup>

     </field>

    </component>



    <!-- Inline linked record: University Conference -->

    <component type="LinkedRecordField" table="university_conferences" parentField="university_id" prefilledFromParent="true">

     <field name="conference_id" displayName="Current Conference">

      <lookup>

       <ref table="conferences" field="name"/>

       <ref table="governing_bodies" field="name"/>

      </lookup>

     </field>

    </component>

   </subSection>

   </subSection>



   <subSection name="Location">

    <field name="city" displayName="City"/>

    <field name="size_of_city" displayName="City Size"/>

    <field name="state" displayName="State"/>

    <field name="region" displayName="Region/Country"/>

   </subSection>



   <subSection name="Academics">

    <field name="average_gpa" displayName="Average GPA"/>

    <field name="sat_ebrw_25th" displayName="SAT EBRW 25th"/>

    <field name="sat_ebrw_75th" displayName="SAT EBRW 75th"/>

    <field name="sat_math_25th" displayName="SAT Math 25th"/>

    <field name="sat_math_75th" displayName="SAT Math 75th"/>

    <field name="act_composite_25th" displayName="ACT Composite 25th"/>

    <field name="act_composite_75th" displayName="ACT Composite 75th"/>

    <field name="acceptance_rate_pct" displayName="Acceptance Rate (%)"/>

    <field name="total_yearly_cost" displayName="Total Yearly Cost"/>

    <field name="majors_offered_url" displayName="Majors Offered URL"/>

    <field name="undergraduate_enrollment" displayName="Undergraduate Enrollment"/>

   </subSection>



   <subSection name="Rankings & Identifiers">

    <field name="us_news_ranking_national_2018" displayName="US News National Ranking (2018)"/>

    <field name="us_news_ranking_liberal_arts_2018" displayName="US News Liberal Arts Ranking (2018)"/>

    <field name="ipeds_nces_id" displayName="IPEDS NCES ID"/>

   </subSection>



   <subSection name="Internal">

    <field name="internal_notes" displayName="Internal Notes"/>

   </subSection>



  </pageSection>

</page>

