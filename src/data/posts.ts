export interface Post {
    name: string;
    slug: string;
    shortDescription: string;
    dateDescription: string;
    body: string;
    link: string;
    linkText: string;
}

export const posts: Post[] = [
    {
        name: "viz",
        slug: "viz",
        shortDescription: "Experiments in computational geometry and urban visualisation using deck.gl",
        dateDescription: "2025",
        body: `
            <p>The options for browser-based geographic data visualisation have improved a lot in recent years, driven particularly by large firms
            open-sourcing their in house visualisation frameworks. Deck.gl is a framework that came out of Uber for this type of task.
            Combined with open source standards like GeoJSON and 3D Tiles, and performant hardware accelerated 3D rendering, it is possible
            to render surprisingly large datasets in real time in a web browser.<p>

            <p>This presents an intesting opportunity to anyone interested in urban modelling and visualisation. The prior art in this space has been
            dominated by desktop GIS software, which is often expensive and has a steep learning curve.<p>

            <p>In addition, there is an emerging body of engineering effort towards 'local first' web applications, which are designed to work well
            offline and synchronise data between devices, allowing (for example) collaborative editing.</p>

            <p>This project is (so far) a very early experiment/tech demo to combine some of these emerging technologies. In the first months of 2025,
            I have been learning deck.gl, reading computational geometry textbooks, and experimenting with building a UI to edit street geometry and generate
            city blocks and buildings based on urban visualisation papers such as
            <a href="https://www.cs.purdue.edu/cgvlab/papers/aliaga/eg2012.pdf">Vanegas et al. (2012)</a>.</p>

            <p><strong>The source code is <a href="https://github.com/oscarcs/viz">viewable here</a>.</strong></p>
        `,
        link: "https://viz.antipodean.ee",
        linkText: "Try the current build"
    },
    {
        name: "Counter FPV",
        slug: "counter-fpv",
        shortDescription: "Counter-drone system using software-defined radio",
        dateDescription: "May 2025",
        body: `
            <p>I attended the European Defence Tech Hackathon in Vilnius, Lithuania in 2025. Held concurrently with the Baltic Miltech Summit, this
            hackathon was part of a series of hackathons being held in Europe as the continent prepares for the significant re-armament triggered by
            the shifting tides of global geopolitics.</p>

            <p>Our team worked on a brief prepared by the Ukrainian Ministry of Defence, which was for the "development of an automatic and autonomous 
            video detection and interception capability in the wide band 200 MHz-6100 MHz to work in a network of similar capabilities to triangulate 
            drones (or at least direction finding) from detected and intercepted video and provide automatic target tracking."</p>

            <p>We built a proof-of-concept system using commercially-available software-defined radio hardware and open-source software (GNU radio & python)
            to detect and intercept video signals from FPV drones. The main issue with previous-generation handheld detection systems being produced by 
            enthuiasts and small companies in Ukraine is that the frequency bands used by the Russian invaders have been changing more often, making a more
            general interception capability necessary.</p>
            
            <p>Our team was one of the top teams selected at the hackathon to pitch our project at the main conference. I was the presenter at both 
            stages of the pitch competition.</p>

            <p>I have two major reflections from this project: the first is that there seems to be a strong tendency towards over-engineering and gold-plating in
            defence procurement, driven in part because funding defence-tech projects is difficult without a dual-use application. The EU and NATO will not
            be able to mount a successful defence of democracy without a serious rethink of the procurement process. The second is an even stronger appreciation
            for the bravery and commitment of the Ukrainians working to defend their homeland. (A particular shout out to Alex, my Ukrainian teammate).</p>
        `,
        link: "https://docs.google.com/presentation/d/1DJ2i2VUG6qLrWDCuZVop2hB_gniYwMC8SzgIbfIEXDU/edit?usp=sharing",
        linkText: "View presentation slides"
    },
    {
        name: "straight-skeleton-geojson",
        slug: "straight-skeleton-geojson",
        shortDescription: "Typescript library for computing straight skeletons of polygons in GeoJSON",
        dateDescription: "2025",
        body: `
            <p>As part of recent experiments in visualisation and computational geometry, I have had need to calculate the 'straight skeleton' of a polygon.
            If you imagine shrinking a polygon, this is the set of straight line segments that the vertices of the polygon trace out as they move towards the
            middle of the polygon.</p>

            <p>It turns out there aren't any great libraries for this in Typescript, so I took some existing code (originally ported from C#) and have been
            working on making it into a more robust fully-featured library. Still a work in progress, but I'm using it in my own projects at the moment.</p>
        `,
        link: "https://github.com/oscarcs/straight-skeleton-geojson",
        linkText: "View on GitHub",
    },
    {
        name: "Legislatures",
        slug: "legislatures",
        shortDescription: "Tool to draw diagrams of legislatures and deliberative assemblies",
        dateDescription: "2017-2022",
        body: `
            <p>I have a big interest in politics. Both the 'squishy' social-scientific elements of good governance, but also the mechanical elements,
            the complex systems that characterize modern political organization - the 'code' of politics. This tool definitely falls into the second category.</p>

            <p>XML, a Dutch architecture firm, released a <a href="http://parliamentbook.com/info/about">book</a> containing some nice diagrams of all the
            parliaments and 'deliberative assemblies' around the world that are responsible for making or approving laws. I own a copy of this book, and it
            inspired me to write some code to generate some similar diagrams. Naturally, the diagrams this tool generates aren't quite as pretty as the ones
            designed by hand by Dutch architects, but it does a pretty good job - and definitely improves on some of the ones that Wikipedia uses.</p>
        `,
        link: "https://github.com/oscarcs/legislatures",
        linkText: "View on GitHub"
    },
    {
        name: "Honours Research Project",
        slug: "part-iv-project",
        shortDescription: "A tile-based programming language to teach programming concepts",
        dateDescription: "2019",
        body: `
            <p>As part of the University of Auckland Engineering programme, students are expected to work on a research project during their final year.
            For our project, we were fortunate to be assigned an interesting research topic: creating a tile-based programming environment for teaching
            novices (especially children and young people) programming. We investigated existing programming systems, and tried to marry together the best
            parts of existing block-based programming systems (like the visual cues that these environments provide) to a text-based programming language.
            Most pre-existing work in this space has focused only on block-based programming languages, so this was an interesting challenge.</p>

            <p>The project was also exciting because I got to design and implement a fully functional programming language from scratch. We attempted
            to integrate the language design tightly into the actual operation of the visual environment. Variables in the programming environment
            were directly correlated with object properties for the entities in the 'world', in an effort to introduce object-oriented programming
            elements.</p>
        `,
        link: "https://github.com/oscarcs/p4p",
        linkText: "View on GitHub"
    }
];

export function getPostBySlug(slug: string): Post | undefined {
    return posts.find(post => post.slug === slug);
}

export function getAllPosts(): Post[] {
    return posts;
}
