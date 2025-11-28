import React from 'react';

function About() {
  return (
    <div>
      <h1>Simpelt framework med sidebar og topbar</h1>
      <p>
        Denne side er et eksempel på, hvordan en simpel hjemmeside kan bygges op fra bunden. 
        Den er blevet opdateret fra ren HTML og CSS til at bruge Bootstrap. 
        Det er ikke perfekt endnu, men det giver os et godt udgangspunkt.
      </p>
      <p>
        Vi bruger Bootstrap i et vist omfang for at kunne demonstrere, hvordan man anvender komponenterne, dette er et eksamenskrav. 
        Bootstrap fungerer som et sæt foruddefinerede byggeklodser, man kan kombinere på forskellige måder.
      </p>
      <p>
        Udseendet er i høj grad styret af Bootstrap, indtil vi finder ud af hvordan vi kapre stilen selv. 
        For mere info om komponenterne kan man se dokumentationen på{' '}
        <a href="https://react-bootstrap.netlify.app/" target="_blank" rel="noreferrer">
          react-bootstrap.netlify.app
        </a>.
      </p>

      <h2>Components og Props</h2>
      <p>
        På siden <strong>Components og Props</strong> bliver der sendt en simpel prop (en int) til komponentet <code>CompAndProps</code>. 
        Komponentet returnerer et billede baseret på den værdi, der bliver sendt med som prop. 
        Det gør det nemt at lave en “plug-and-play”, hvor vi kan tilføje forskellige sider og funktioner.
      </p>

      <h2>Hvad er Props?</h2>
      <p>
        Props (&quot;properties&quot;) er måden, vi sender data fra et parent-komponent til et child-komponent på. 
        De er i praksis bare et objekt med information, som komponentet kan bruge til at generere dynamisk indhold.
      </p>
      <p>
        Det er god praksis at lade props indeholde data og ikke færdig HTML. 
        Selve HTML-strukturen bør så vidt muligt genereres inde i komponenterne, så koden bliver mere overskuelig og genanvendelig.
        Alt andet er bad practice, og efter lidt mere research burde de undgås fuldstændig (Fandt dårlige eksempler på stackoverflow før).
      </p>

      <h2>Brug af components</h2>
      <p>
        Hvis du kigger i mappen <code>components</code>, kan du se, at der lige nu findes der et komponent:
        <code>RandPic.jsx</code>. 
      </p>
      <p>
        <code>RandPic.jsx</code> returnerer et billede baseret på et tilfældigt tal. 
        Billederne skal ligge på &quot;serveren&quot; for eksempel i mappen <code>pics</code> – for at kunne vises.
        Du kan se eksempler på brugen i <code>Home.jsx</code> eller <code>CompAndProps.jsx</code>.
      </p>

      <h2>AppRoutes.jsx</h2>
      <p>
        <code>AppRoutes.jsx</code> står for at styre routingen mellem de forskellige sider. 
        Lige nu bliver <code>AppRoutes</code> brugt i <code>App.jsx</code>, hvilket betyder, at topbaren (og eventuelle sidebars) er synlige hele tiden.
      </p>
      <p>
        Hvis vi senere vil have sider uden disse elementer, skal vi justere strukturen en smule og tænke mere fleksibelt i forhold til, hvordan vi genererer HTML’en. 
        Det er noget, vi kan tage op på et senere tidspunkt.
      </p>
    </div>
  );
}

export default About;