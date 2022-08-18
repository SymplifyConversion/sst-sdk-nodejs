Preview Mode
============

In order to safely verify that a server-side test is working in production as
you want it to, it's possible to configure the project for "preview" mode. Even
if you have a separate staging environemnt, you might want to double check a
test in production before enabling it for all visitors.

Features
========

* a test which is not active can safely be added to your backend code first

* previewing or activating does not require any changes in your backend code

* when previewing, you can select the variation you want to see

* in preview mode, a test will not track any goals

* when previewing, you can debug audience rules, seeing the results of subexpressions

How to use it
=============

Open the SST project for preview as per usual. Select the variation you want to see. You can copy the URL in your location bar to share with others who need to preview.

How it works
============

Opening in preview mode sets the `"pmr"` property in the website object in the
`sg_cookies` JSON cookie to the ID of the previewed project. The ID of the
previewed variation is written next to it under the key `"pmv”`.

The SST SDK when checking a project for variation allocation will always check
the preview status first. If a visitor is previewing a project variation, no
allocation calculation is performed (the preview status overrides it), but the
allocation persistence works as usual.

The `js-sdk` frontend is aware of the preview status, it will prevent goal
tracking etc. and expose some extra information about the allocation and
audience calculation.

The project audience when previewing will be "traced" by the server running the
SDK, annotating the rules expression with results of sub-expressions and share
this trace back with the requesting browser via a cookie ("sg_audience_trace").

Security
========

The purpose of the preview feature is to let you double-check if a test is going
to work and how it will look before activating it. It is not meant to hide
project configurations from any potential attacker.

Since the preview shows the results of subexpressions in any project custom
audience rules, do not use any sensitive information in audience rules. 
