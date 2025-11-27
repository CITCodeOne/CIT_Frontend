import React from 'react';

function About() {
  return (
    <div>
      <h1>Simpelt Framework med Sidebar og Topbar</h1>
      <p>
        Dette er et eksempel på, hvordan en side kan bygges op fra bunden. Vi starter med en minimal mængde CSS for at få layoutet til at se nogenlunde korrekt ud.
        Frameworket bruger routing til at navigere mellem forskellige sider, som forklaret af Morten i undervisningen. Derudover er der en sidebar, der gør det muligt at navigere mellem forskellige sektioner på hjemmesiden gennem links.
      </p>
      <h2>Components og Props</h2>
      <p>
        Under hjemmesidens <strong>Components og Props</strong> bliver der parset en simpel prop (en integer), som bruges af komponentet <code>CompAndProps</code>. Dette komponent returnerer et billede baseret på den værdi, der bliver sendt med som prop.
        Dette gør det nemt at lave en "plug-and-play"-struktur, hvor man kan tilføje forskellige sider og funktioner.
      </p>
      <h2>Hvad er Props?</h2>
      <p>
        Props (&quot;properties&quot;) skal ses som at være en måde at sende data fra parent-komponent til en child-komponent. De er bare et simpelt objekt, der indeholder information, som komponentet kan bruge til at generere dynamisk indhold.
        Det er vigtigt at bemærke, at props så vidt som muligt kun skal bruges til at sende data, ikke til at generere HTML direkte eller indeholde html, da det efter mere omhyggelig research er bad practice.
        Så for at vi holder os til god praksis, lader vi komponenterne stå for at generere HTML, mens props kun leverer data.
      </p>
      <h2>Brug af components</h2>
      <p>
        Hvis man kigger i filerne kan man se to under folderen components at der på nuværende tidspunkt eksistere 2.
        Navbar.jsx er mere eller mindre statisk, og er bare en function som retunere links til de forskellige sider, hvor RandPic.jsx retunere et billede basseret på et tilfældigt tal, billeder skal eksistere på &quot;serveren&quot; altså i folderen pics eller andre steder,
        hvis man ønsker at gøre brug af det. Evt se Home/hjem eller CompAndProps.jsx for at finde syntaxen for at vise billeder.
      </p>
      <h2>AppRoutes.jsx</h2>
      <p>
        Approutes.jsx er det der står for routingen af de forskellige sider. På nuværende tidspunkt bruger vi approutes i app.jsx hvilket gør at vi altid vil have top og side bars, 
        så hvis vi ønsker andet skal jeg lige finde på en lidt smartere løsning i forhold til at genere html (Tænker vi tager det til et møde).
        Som nævnt tideligere bliver routes kaldt på under app.jsx ved linjen &lt;main className=&quot;content&quot;&gt;&lt;/main&gt;
      </p>
       <h1>Simpelt Framework med Sidebar og Topbar</h1>
      <p>
        Dette er et eksempel på, hvordan en side kan bygges op fra bunden. Vi starter med en minimal mængde CSS for at få layoutet til at se nogenlunde korrekt ud.
        Frameworket bruger routing til at navigere mellem forskellige sider, som forklaret af Morten i undervisningen. Derudover er der en sidebar, der gør det muligt at navigere mellem forskellige sektioner på hjemmesiden gennem links.
      </p>
      <h2>Components og Props</h2>
      <p>
        Under hjemmesidens <strong>Components og Props</strong> bliver der parset en simpel prop (en integer), som bruges af komponentet <code>CompAndProps</code>. Dette komponent returnerer et billede baseret på den værdi, der bliver sendt med som prop.
        Dette gør det nemt at lave en "plug-and-play"-struktur, hvor man kan tilføje forskellige sider og funktioner.
      </p>
      <h2>Hvad er Props?</h2>
      <p>
        Props (&quot;properties&quot;) skal ses som at være en måde at sende data fra parent-komponent til en child-komponent. De er bare et simpelt objekt, der indeholder information, som komponentet kan bruge til at generere dynamisk indhold.
        Det er vigtigt at bemærke, at props så vidt som muligt kun skal bruges til at sende data, ikke til at generere HTML direkte eller indeholde html, da det efter mere omhyggelig research er bad practice.
        Så for at vi holder os til god praksis, lader vi komponenterne stå for at generere HTML, mens props kun leverer data.
      </p>
      <h2>Brug af components</h2>
      <p>
        Hvis man kigger i filerne kan man se to under folderen components at der på nuværende tidspunkt eksistere 2.
        Navbar.jsx er mere eller mindre statisk, og er bare en function som retunere links til de forskellige sider, hvor RandPic.jsx retunere et billede basseret på et tilfældigt tal, billeder skal eksistere på &quot;serveren&quot; altså i folderen pics eller andre steder,
        hvis man ønsker at gøre brug af det. Evt se Home/hjem eller CompAndProps.jsx for at finde syntaxen for at vise billeder.
      </p>
      <h2>AppRoutes.jsx</h2>
      <p>
        Approutes.jsx er det der står for routingen af de forskellige sider. På nuværende tidspunkt bruger vi approutes i app.jsx hvilket gør at vi altid vil have top og side bars, 
        så hvis vi ønsker andet skal jeg lige finde på en lidt smartere løsning i forhold til at genere html (Tænker vi tager det til et møde).
        Som nævnt tideligere bliver routes kaldt på under app.jsx ved linjen &lt;main className=&quot;content&quot;&gt;&lt;/main&gt;
      </p>
    </div>
  );
}

export default About;